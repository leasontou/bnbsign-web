echo "zip dist..."
zip -r -m -o '../dist.zip' '../dist'
echo "upload dist to web server,uploading..."
scp -r ../dist.zip root@47.245.31.136:/web
echo "upload done. login web server ..."
ssh root@47.245.31.136 'bash -s' < ./handle.sh '/web/bnbsign/sign'
