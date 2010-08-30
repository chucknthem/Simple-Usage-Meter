#!/bin/sh
working_dir=`pwd`
cd ..

version=`grep 'version' $working_dir/manifest.json | tr '"' '\n' |grep '[0-9]'`

zip -r $working_dir/Simple-Usage-Meter-$version.zip $working_dir -x \*.git\* -x \*testdata\* 
