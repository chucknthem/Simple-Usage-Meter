#!/bin/sh
working_dir=`pwd`
cd ..
echo $working_dir

version=`grep 'version' $working_dir/manifest.json | tr '"' '\n' |grep '[0-9]'`

zip -r $working_dir/Simple-Usage-Meter-$version.zip $working_dir -x \*.git\*  $working_dir/testdata\*  $working_dir/docs\*  \*.zip
