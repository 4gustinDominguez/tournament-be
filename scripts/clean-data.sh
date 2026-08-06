#!/bin/bash

DATA_DIR="./t-form-api/data"

if [ ! -d "$DATA_DIR" ]; then
    echo "Error: Directory $DATA_DIR does not exist."
    exit 1
fi

echo "Cleaning data in $DATA_DIR..."

for file in "$DATA_DIR"/*.json; do
    if [ -f "$file" ]; then
        echo "[]" > "$file"
        echo "Cleaned $(basename "$file")"
    fi
done

echo "Data cleaning complete."
