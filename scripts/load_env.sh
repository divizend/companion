#!/bin/bash

# Check if the .env file is passed as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 path_to_env_file"
  exit 1
fi

# Check if the .env file exists
if [ ! -f "$1" ]; then
  echo ".env file not found!"
  exit 1
fi

# Export each line in the .env file as environment variable
export $(grep -v '^#' "$1" | xargs)
