$ErrorActionPreference = "Stop"
cd dist
npm install --production
if(Test-Path \\DISKSTATION\homes\admin\NodeProjects\cat-filesrepo) {
    Remove-Item \\DISKSTATION\homes\admin\NodeProjects\cat-filesrepo -Recurse
}
mkdir \\DISKSTATION\homes\admin\NodeProjects\cat-filesrepo
Copy-Item * \\DISKSTATION\homes\admin\NodeProjects\cat-filesrepo -Recurse
echo ***** set config on ds211 *****


