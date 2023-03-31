#! /bin/bash

MANY_PATH="../many-rs"
MANY_CMD="./target/debug/many"

cd $MANY_PATH
$MANY_CMD message status --hex
