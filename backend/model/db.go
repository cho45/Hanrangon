package model

import (
	"context"
	"database/sql"
)

// DBTX is the interface that sqlc-generated code expects.
type DBTX interface {
	ExecContext(context.Context, string, ...interface{}) (sql.Result, error)
	PrepareContext(context.Context, string) (*sql.Stmt, error)
	QueryContext(context.Context, string, ...interface{}) (*sql.Rows, error)
	QueryRowContext(context.Context, string, ...interface{}) *sql.Row
}

// Database represents a database connection with its associated queries.
type Database[Q any] struct {
	*sql.DB
	Q          Q
	newQueries func(DBTX) Q
}

// NewDatabase creates a new Database wrapper.
func NewDatabase[Q any](db *sql.DB, newQueries func(DBTX) Q) *Database[Q] {
	return &Database[Q]{
		DB:         db,
		Q:          newQueries(db),
		newQueries: newQueries,
	}
}

// Transaction represents a database transaction with its associated queries.
type Transaction[Q any] struct {
	*sql.Tx
	Q Q
}

// BeginTxx starts a transaction and returns a Transaction wrapper.
func (d *Database[Q]) BeginTxx(ctx context.Context, opts *sql.TxOptions) (*Transaction[Q], error) {
	tx, err := d.BeginTx(ctx, opts)
	if err != nil {
		return nil, err
	}
	return &Transaction[Q]{
		Tx: tx,
		Q:  d.newQueries(tx),
	}, nil
}

// BeginImmediate starts a transaction with BEGIN IMMEDIATE and returns a Transaction wrapper.
// This is specific to SQLite to acquire a write lock immediately.
func (d *Database[Q]) BeginImmediate(ctx context.Context) (*Transaction[Q], error) {
	tx, err := d.BeginTx(ctx, nil)
	if err != nil {
		return nil, err
	}
	if _, err := tx.ExecContext(ctx, "ROLLBACK; BEGIN IMMEDIATE"); err != nil {
		tx.Rollback()
		return nil, err
	}
	return &Transaction[Q]{
		Tx: tx,
		Q:  d.newQueries(tx),
	}, nil
}

// WithTx executes a function within a transaction.
func (d *Database[Q]) WithTx(ctx context.Context, fn func(Q) error) error {
	tx, err := d.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	q := d.newQueries(tx)
	if err := fn(q); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}
