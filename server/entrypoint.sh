#!/bin/bash

echo "Running tests..."
npm test

if [ $? -ne 0 ]; then
    echo "(x) Tests failed. Exiting."
  exit 1
fi

echo "(v) Tests passed. Starting server..."
npm run start
