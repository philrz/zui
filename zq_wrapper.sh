#!/bin/bash
TMP_STDOUT=$(mktemp)_zq_wrapper_stdout.txt
TMP_STDERR=$(mktemp)_zq_wrapper_stderr.txt
TMP_CALLED_WITH=$(mktemp)
echo "I was called with: $@" > ${TMP_CALLED_WITH}_zq_wrapper_called_with.txt
../../apps/zui/zdeps/zq "$@" > $TMP_STDOUT 2> $TMP_STDERR
cat $TMP_STDOUT
cat $TMP_STDERR >&2
