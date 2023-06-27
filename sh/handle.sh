WEBPATH=$1

echo 'web path :' $WEBPATH

cd /web
echo "unzip dist.zip ..."
unzip dist.zip
echo "unzip done"
ls
echo ""
echo "done, force move to web path..."
rm -rf $WEBPATH
mv -f ./dist $WEBPATH
rm -f dist.zip
echo "deploy done!"