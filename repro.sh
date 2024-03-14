#!/bin/bash
num=1
success=0
fail=0
while true; do
  { yarn e2e -g pool-loads.spec.ts --skip-nx-cache ; err="$?"; } || true
  if [ $err -eq 0 ]; then
    success=$(expr $success + 1)
  else
    fail=$(expr $fail + 1)
  fi
  num=$(expr $num + 1)
  echo "success=$success fail=$fail"
done

