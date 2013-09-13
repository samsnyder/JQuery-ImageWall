<!doctype html>
<html>
<head>

<link rel='stylesheet' href='style.css'>

<script src='jquery.js'></script>
<script src='jquery.imageWall.js'></script>

<script>

<?php

	$imagePaths = array();
	if($handle = opendir('src')){
		while(false !== ($entry = readdir($handle))){
			if(substr($entry, 0, 1) != '.'){
				array_push($imagePaths, 'src/'.$entry);
			}
		}
	}

?>

var imagePaths = <?php echo(json_encode($imagePaths))?>;

$(document).ready(function(){
	$('#imageWall').imageWall({
		imagePaths: imagePaths,
		imageGrid: true
	});
});

</script>

<style>

#imageWall{
	width: 100%;
	height: 100%;
	position: absolute;
	top: 0px;
	left: 0px;
}

</style>

</head>
<body>



<div id='imageWall'></div>

</body>
</html>