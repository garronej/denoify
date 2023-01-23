for file in $(find './test' -name '*.test.ts')
do
  if grep -q '\.only' "$file"; then
    echo "ERROR: The test file $file contains '.only' test cases!"
    exit 1
  fi
done
