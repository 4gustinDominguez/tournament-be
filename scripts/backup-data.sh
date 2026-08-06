#!/bin/bash

SOURCE_DIR="./t-form-api/data"
TARGET_DIR="./t-form-api/data-copy"

if [ ! -d "$SOURCE_DIR" ]; then
    echo "Error: Directory $SOURCE_DIR does not exist."
    exit 1
fi

echo "Backing up data from $SOURCE_DIR to $TARGET_DIR..."

mkdir -p "$TARGET_DIR"
cp -r "$SOURCE_DIR"/* "$TARGET_DIR/"

echo "Backup complete."
