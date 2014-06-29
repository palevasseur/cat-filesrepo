cat-filesrepo
=============
Photo file format:<br>
[owner name] N123 N456 - reference photo.jpg<br>
[owner name] is optional, can contains space, and minus 'owner-name' but NOT minus with space 'owner - name'<br>
--<br>
on ds211:<br>
// ceramiques files: /volume1/photo/Catalogue des ceramiques<br>
// node src: /volume1/homes/admin/NodeProjects<br>
--<br>
deploy:<br>
1/ create dist (grunt deploy task)<br>
2/ copy on server + [npm install --production]<br>
3/ change config.json (current=ds211) + [node filesrepo.js]<br>

Create files list:
Get-ChildItem -Filter *.jpg | Format-Table Name > catceramlist.txt