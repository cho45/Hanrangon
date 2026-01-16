#!/usr/bin/env node

/**
 * Go test profiling script
 *
 * 1. Run all tests with -v to identify slow packages
 * 2. Profile the slowest package
 * 3. Display analysis
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const GO_TAGS = 'sqlite_math_functions';
const PROFILE_DIR = 'var/profiles';

function runCommand(cmd, options = {}) {
	console.log(`\n$ ${cmd}`);
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

function parseTestTimes(output) {
	// Parse lines like: ok   github.com/cho45/hanrangon/backend/app  7.769s
	const regex = /^ok\s+(\S+)\s+(\d+\.\d+)s/gm;
	const packages = [];
	let match;

	while ((match = regex.exec(output)) !== null) {
		packages.push({
			name: match[1],
			time: parseFloat(match[2])
		});
	}

	return packages.sort((a, b) => b.time - a.time);
}

function main() {
	console.log('=== Go Test Profiling ===\n');

	// Step 1: Run all tests to identify slow packages
	console.log('Step 1: Running all tests (cache disabled) to identify slow packages...');
	const testOutput = runCommand(
		`go test -count=1 -tags "${GO_TAGS}" ./...`,
		{ silent: true, ignoreError: true }
	);

	console.log(testOutput);

	// Parse test times
	const packages = parseTestTimes(testOutput);

	if (packages.length === 0) {
		console.error('\nNo packages found or all tests failed.');
		process.exit(1);
	}

	console.log('\n=== Test Times by Package ===');
	packages.forEach((pkg, i) => {
		console.log(`${i + 1}. ${pkg.name.padEnd(60)} ${pkg.time.toFixed(3)}s`);
	});

	// Step 2: Profile the slowest package
	const slowest = packages[0];
	console.log(`\n=== Profiling slowest package: ${slowest.name} (${slowest.time}s) ===\n`);

	// Create profile directory
	if (!fs.existsSync(PROFILE_DIR)) {
		fs.mkdirSync(PROFILE_DIR, { recursive: true });
	}

	// Extract package path (remove module prefix)
	const pkgPath = './' + slowest.name.split('/').slice(3).join('/');

	// Run profiling
	runCommand(
		`go test -count=1 -tags "${GO_TAGS}" ` +
		`-cpuprofile=${PROFILE_DIR}/cpu.prof ` +
		`-memprofile=${PROFILE_DIR}/mem.prof ` +
		`-blockprofile=${PROFILE_DIR}/block.prof ` +
		`-mutexprofile=${PROFILE_DIR}/mutex.prof ` +
		pkgPath
	);

	// Step 3: Show profile files
	console.log('\n=== Profile Files Generated ===');
	const profiles = fs.readdirSync(PROFILE_DIR)
		.filter(f => f.endsWith('.prof'))
		.map(f => {
			const stat = fs.statSync(path.join(PROFILE_DIR, f));
			return { name: f, size: stat.size };
		});

	profiles.forEach(p => {
		console.log(`  ${p.name.padEnd(20)} ${(p.size / 1024).toFixed(1)} KB`);
	});

	// Step 4: Show top CPU consumers
	console.log('\n=== Top CPU Consumers ===');
	try {
		const cpuTop = runCommand(
			`go tool pprof -top -cum ${PROFILE_DIR}/cpu.prof`,
			{ silent: true }
		);
		console.log(cpuTop.split('\n').slice(0, 15).join('\n'));
	} catch (error) {
		console.log('(Unable to analyze CPU profile)');
	}

	// Step 5: Show analysis commands
	console.log('\n=== Analyze Profiles ===');
	console.log(`Interactive web UI:`);
	console.log(`  go tool pprof -http=:8080 ${PROFILE_DIR}/cpu.prof`);
	console.log(`  go tool pprof -http=:8080 ${PROFILE_DIR}/mem.prof`);
	console.log(``);
	console.log(`Command line:`);
	console.log(`  go tool pprof -top -cum ${PROFILE_DIR}/cpu.prof | head -40`);
	console.log(`  go tool pprof -list <function_name> ${PROFILE_DIR}/cpu.prof`);
	console.log(``);
}

main();
