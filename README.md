cat-filesrepo
=============
Photo file format:
<owner name> N123 N456 - reference photo.jpg
<owner name> is optional, can contains space, and minus 'owner-name' but NOT minus with space 'owner - name'
=============
on ds211:
// ceramiques files: /volume1/photo/Catalogue des ceramiques
// node src: /volume1/homes/admin/NodeProjects
=============
deploy:
1/ create dist (grunt deploy task)
2/ copy on server + [npm install --production]
3/ change config.json (current=ds211) + [node filesrepo.js]
