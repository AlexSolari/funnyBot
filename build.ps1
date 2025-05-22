Remove-Item -r -fo build
mkdir build
Copy-Item "package.json" -Destination "build\" -Force
Copy-Item "token.*" -Destination "build\" -Force
Copy-Item "index.ts" -Destination "build\" -Force
Copy-Item ".\content\" -Destination "build\content\" -Force -Recurse
Copy-Item ".\entities\" -Destination "build\entities\" -Force -Recurse
Copy-Item ".\actions\" -Destination "build\actions\" -Force -Recurse
Copy-Item ".\helpers\" -Destination "build\helpers\" -Force -Recurse
Copy-Item ".\types\" -Destination "build\types\" -Force -Recurse
Copy-Item ".\entities\" -Destination "build\entities\" -Force -Recurse