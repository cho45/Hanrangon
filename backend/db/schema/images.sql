CREATE TABLE images (
	id INTEGER PRIMARY KEY,
	uri TEXT NOT NULL,
	entry_id INTEGER NOT NULL,
	sig BLOB NOT NULL
);
CREATE UNIQUE INDEX index_images_uri ON images (uri, entry_id);
CREATE INDEX index_images_entry_id ON images (entry_id);
CREATE INDEX index_images_unindexed ON images (entry_id) WHERE length(sig) = 0;

CREATE TABLE ngram (
	word INTEGER NOT NULL,
	image_id INTEGER NOT NULL,
	PRIMARY KEY (word, image_id)
) WITHOUT ROWID;
CREATE INDEX index_ngram_image_id ON ngram (image_id);
