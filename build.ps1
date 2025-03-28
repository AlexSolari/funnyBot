function Generate {
    param (
        $Folder
    )

    $result = "//THIS FILE WAS GENERATED BY CODEGEN`n";
    Set-Location $Folder;
    $names = Get-ChildItem | Select-Object -ExpandProperty Name;
    $array = "export default [";
    foreach ($i in $names) {
        $varname = $i.split(".")[0];
        $require = "import " + $varname + " from './" + $Folder + "/" + $i.Substring(0, $i.Length - 3) + "';";
        $array += $varname + "," ;
        $result += $require + "`n";
    }
    $array = $array.Substring(0, $array.Length - 1);
    $array += "].filter(x => x.active);";
    Set-Location ..;
    $result += "`n" + $array;

    Write-Output $result
}

Set-Location functionality
$c = Generate -Folder 'commands';
$t = Generate -Folder 'scheduled';
Out-File -Encoding utf8 -FilePath .\gen_commands.ts -InputObject $c
Out-File -Encoding utf8 -FilePath .\gen_scheduled.ts -InputObject $t
Set-Location ..
Remove-Item -r -fo build
mkdir build
Copy-Item "package.json" -Destination "build\" -Force
Copy-Item "token.*" -Destination "build\" -Force
Copy-Item "index.ts" -Destination "build\" -Force
Copy-Item ".\content\" -Destination "build\content\" -Force -Recurse
Copy-Item ".\entities\" -Destination "build\entities\" -Force -Recurse
Copy-Item ".\functionality\" -Destination "build\functionality\" -Force -Recurse
Copy-Item ".\helpers\" -Destination "build\helpers\" -Force -Recurse
Copy-Item ".\types\" -Destination "build\types\" -Force -Recurse
Copy-Item ".\entities\" -Destination "build\entities\" -Force -Recurse