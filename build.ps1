function Generate{
    param (
        $Folder
    )

    $result = ";//THIS FILE WAS GENERATED BY CODEGEN`n";
    Set-Location $Folder;
    $names = Get-ChildItem | Select-Object -ExpandProperty Name;
    $array = "export default [";
    foreach ($i in $names) {
        $varname = $i.split(".")[0];
        $require = "import " + $varname + " from './"+ $Folder +"/" + $i + "';";
        $array += $varname + "," ;
        $result += $require + "`n";
    }
    $array = $array.Substring(0,$array.Length-1);
    $array += "].filter(x => x.active);";
    Set-Location ..;
    $result += "`n`n" + $array;

    Write-Output $result
}

Set-Location functionality
$c = Generate -Folder 'commands';
$t = Generate -Folder 'triggers';
Out-File -Encoding utf8 -FilePath .\gen_commands.js -InputObject $c
Out-File -Encoding utf8 -FilePath .\gen_triggers.js -InputObject $t
Set-Location ..
Remove-Item -r -fo build
mkdir build
Copy-Item "token.*" -Destination "build\" -Force
Copy-Item ".\content\" -Destination "build\content\" -Force -Recurse
npm run build