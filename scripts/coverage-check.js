#!/usr/bin/env node

/**
 * Go coverage check script
 *
 * 1. Run tests with coverage profile
 * 2. Parse coverage data
 * 3. Aggregate by package
 * 4. Display LLM-friendly report
 */

import { execSync } from 'child_process';
import fs from 'fs';

const GO_TAGS = 'sqlite_math_functions';
const COVER_PROFILE = 'cover.out';

// extractReceiverType extracts receiver type from Go source at specific line
function extractReceiverType(filePath, lineNum) {
	try {
		const content = fs.readFileSync(filePath, 'utf-8');
		const lines = content.split('\n');
		const targetLine = lines[parseInt(lineNum) - 1];

		// Match: func (e Entry) MethodName or func (e *Entry) MethodName
		const receiverMatch = targetLine.match(/^func\s+\((\w+)\s+\*?(\w+)\)\s+(\w+)/);
		if (receiverMatch) {
			return receiverMatch[2]; // Return type name
		}

		return null;
	} catch (error) {
		return null;
	}
}

function runCommand(cmd, options = {}) {
	if (!options.silent) {
		console.log(`$ ${cmd}`);
	}
	try {
		return execSync(cmd, {
			encoding: 'utf-8',
			stdio: options.silent ? 'pipe' : 'inherit',
			...options
		});
	} catch (error) {
		if (options.ignoreError) {
			return error.stdout || '';
		}
		throw error;
	}
}

function parseCoverageData(output) {
	// Parse: "github.com/cho45/hanrangon/backend/app/app.go:131: SimilarityCalculator 0.0%"
	const lines = output.trim().split('\n');
	const packages = new Map();
	let totalCoverage = null;

	for (const line of lines) {
		// Extract total coverage
		if (line.includes('total:')) {
			const match = line.match(/([\d.]+)%$/);
			if (match) {
				totalCoverage = parseFloat(match[1]);
			}
			continue;
		}

		// Parse function coverage
		const match = line.match(/^(.+):(\d+):\s+(\S+)\s+([\d.]+)%/);
		if (!match) continue;

		const [, fullPath, lineNum, funcName, coverage] = match;

		// Extract package name from full path
		// e.g., "github.com/cho45/hanrangon/backend/app/app.go" -> "backend/app"
		const pathParts = fullPath.split('/');
		const repoIndex = pathParts.indexOf('hanrangon');
		if (repoIndex === -1) continue;

		const relativePath = pathParts.slice(repoIndex + 1);
		const fileName = relativePath.pop();
		const pkgName = relativePath.join('/');

		if (!pkgName) continue; // Skip if no package name

		// Skip generated code and non-production code
		const shouldSkip =
			// sqlc generated code (*.sql.go, db.go, models.go, querier.go)
			(pkgName.startsWith('backend/model') &&
				(fileName.endsWith('.sql.go') || fileName === 'db.go' || fileName === 'models.go' || fileName === 'querier.go')) ||
			// PoC and migration tools (not production code)
			pkgName.startsWith('cmd/');

		if (shouldSkip) {
			continue;
		}

		if (!packages.has(pkgName)) {
			packages.set(pkgName, {
				name: pkgName,
				total: 0,
				uncovered: [],
				coverages: []
			});
		}

		const pkg = packages.get(pkgName);
		pkg.total++;
		pkg.coverages.push(parseFloat(coverage));

		if (parseFloat(coverage) === 0.0) {
			// Extract receiver type for methods
			// Convert Go package path to file system path
			const fsPath = relativePath.concat(fileName).join('/');
			const receiverType = extractReceiverType(fsPath, lineNum);

			pkg.uncovered.push({
				file: fileName,
				line: lineNum,
				name: funcName,
				receiver: receiverType
			});
		}
	}

	return { packages, totalCoverage };
}

function calculatePackageCoverage(pkg) {
	if (pkg.coverages.length === 0) return 0;
	const sum = pkg.coverages.reduce((a, b) => a + b, 0);
	return sum / pkg.coverages.length;
}

function classifyFunctions(packages) {
	let exportedCount = 0;
	let internalCount = 0;

	for (const pkg of packages.values()) {
		for (const fn of pkg.uncovered) {
			// Exported functions start with uppercase
			if (fn.name[0] === fn.name[0].toUpperCase()) {
				exportedCount++;
			} else {
				internalCount++;
			}
		}
	}

	return { exportedCount, internalCount };
}

function displayReport(packages, totalCoverage, classification) {
	const totalFunctions = Array.from(packages.values()).reduce((sum, pkg) => sum + pkg.total, 0);
	const totalUncovered = Array.from(packages.values()).reduce((sum, pkg) => sum + pkg.uncovered.length, 0);
	const uncoveredPercent = totalFunctions > 0 ? (totalUncovered / totalFunctions * 100).toFixed(1) : 0;

	// Section 1: Summary
	console.log('\n' + '─'.repeat(60));
	console.log('                 COVERAGE CHECK SUMMARY                 ');
	console.log('─'.repeat(60));
	console.log(`Total Coverage:        ${totalCoverage?.toFixed(1) || 'N/A'}% of statements`);
	console.log(`Packages Tested:       ${packages.size} packages`);
	console.log(`Functions Analyzed:    ${totalFunctions} total functions`);
	console.log(`Uncovered Functions:   ${totalUncovered} functions (${uncoveredPercent}%)`);
	console.log('');

	if (totalUncovered > 0) {
		console.log(`Status: ⚠️  WARNING - ${totalUncovered} functions have 0.0% coverage`);
	} else {
		console.log('Status: ✅ All functions have test coverage!');
	}

	// Section 2: Coverage by Package
	console.log('\n=== Coverage by Package ===');
	const pkgArray = Array.from(packages.values());
	pkgArray.sort((a, b) => {
		const aCov = calculatePackageCoverage(a);
		const bCov = calculatePackageCoverage(b);
		return aCov - bCov; // Sort by coverage (ascending)
	});

	console.log('Package'.padEnd(50) + 'Coverage    0.0% Functions');
	for (const pkg of pkgArray) {
		const avgCov = calculatePackageCoverage(pkg);
		const covStr = avgCov.toFixed(1) + '%';
		const uncovStr = `${pkg.uncovered.length} / ${pkg.total}`;
		console.log(pkg.name.padEnd(50) + covStr.padEnd(12) + uncovStr);
	}

	// Section 3: Uncovered Functions
	// Sort packages by number of uncovered functions (descending)
	const pkgsWithUncovered = pkgArray.filter(pkg => pkg.uncovered.length > 0);
	pkgsWithUncovered.sort((a, b) => b.uncovered.length - a.uncovered.length);

	if (totalUncovered > 0) {
		console.log('\n=== Uncovered Functions (0.0% Coverage) ===\n');

		for (const pkg of pkgsWithUncovered) {
			console.log(`${pkg.name} (${pkg.uncovered.length} functions):`);

			// Group by file
			const byFile = new Map();
			for (const fn of pkg.uncovered) {
				if (!byFile.has(fn.file)) {
					byFile.set(fn.file, []);
				}
				byFile.get(fn.file).push(fn);
			}

			for (const [file, fns] of byFile) {
				for (const fn of fns) {
					const displayName = fn.receiver ? `(${fn.receiver}).${fn.name}()` : `${fn.name}()`;
					console.log(`  ${file}:${fn.line}`.padEnd(35) + displayName);
				}
			}
			console.log('');
		}
	}

	// Section 4: Function Classification
	if (totalUncovered > 0) {
		console.log('=== Function Classification ===');
		console.log(`Exported (Public):     ${classification.exportedCount} uncovered (${(classification.exportedCount / totalUncovered * 100).toFixed(1)}%)`);
		console.log(`Internal (Private):    ${classification.internalCount} uncovered (${(classification.internalCount / totalUncovered * 100).toFixed(1)}%)`);
	}

	// Section 5: Next Steps
	console.log('\n=== Next Steps ===');
	console.log('Generate HTML coverage report:');
	console.log(`  go test -coverprofile=${COVER_PROFILE} -tags "${GO_TAGS}" ./...`);
	console.log(`  go tool cover -html=${COVER_PROFILE} -o coverage.html`);
	console.log('  open coverage.html');
	console.log('');

	if (pkgsWithUncovered && pkgsWithUncovered.length > 0) {
		console.log('Priority packages to improve:');
		const topPkgs = pkgsWithUncovered.slice(0, 3);
		topPkgs.forEach((pkg, i) => {
			const avgCov = calculatePackageCoverage(pkg);
			console.log(`  ${i + 1}. ${pkg.name} (${avgCov.toFixed(1)}% coverage) - ${pkg.uncovered.length} uncovered functions`);
		});
		console.log('');
	}

	console.log('─'.repeat(60));
	console.log('✓ Coverage check complete (exit 0 - warnings only)');
	console.log('─'.repeat(60));
}

function main() {
	console.log('=== Running Coverage Tests ===\n');

	// Step 1: Run coverage tests
	console.log('Running tests with coverage profile...');
	runCommand(`go test -coverprofile=${COVER_PROFILE} -tags "${GO_TAGS}" ./...`, {
		ignoreError: true
	});

	// Check if coverage file was created
	if (!fs.existsSync(COVER_PROFILE)) {
		console.error('\n❌ Error: Coverage profile not created. Tests may have failed.');
		console.error('Run "make test-go" to see detailed test errors.');
		process.exit(1);
	}

	console.log('\nAnalyzing coverage data...');

	// Step 2: Get coverage data
	const coverOutput = runCommand(`go tool cover -func=${COVER_PROFILE}`, {
		silent: true,
		ignoreError: true
	});

	// Step 3: Parse and aggregate
	const { packages, totalCoverage } = parseCoverageData(coverOutput);
	const classification = classifyFunctions(packages);

	// Step 4: Display report
	displayReport(packages, totalCoverage, classification);

	// Step 5: Always exit 0 (warning mode)
	process.exit(0);
}

main();
