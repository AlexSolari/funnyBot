cd functionality
.\codegen.ps1
cd ..
rm -r -fo build
mkdir build
Copy-Item "token.*" -Destination "build\" -Force
Copy-Item ".\content\" -Destination "build\content\" -Force -Recurse
npm run build