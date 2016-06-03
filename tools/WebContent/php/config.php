<?php
//error_reporting(E_ALL ^ E_DEPRECATED);
$server_name = "localhost";
$server_username = "tools";
$server_password = "tools1234";
$server_db = "tools";

//Create connection to database
$conn = mysqli_connect($server_name, $server_username, $server_password);
if (!$conn) {
	echo "Could not connect: " . mysqli_error();
	die();
}

mysqli_select_db($server_db, $conn);
mysqli_query("SET NAMES UTF8");

function close(){
	if($conn) mysqli_close($conn);
}
?>
