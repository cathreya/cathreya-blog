#!/bin/bash

# loop through all .markdown files in the current directory
for file in *.markdown; do
    # skip if no .markdown files are found
    [ -e "$file" ] || continue
    # rename the file to .md extension
    mv -- "$file" "${file%.markdown}.md"
done

