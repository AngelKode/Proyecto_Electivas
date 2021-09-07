<?php

    $server = "localhost"; 
    $username = "root"; 
    $data_base = "constancias"; 
    $password = "";

    //Hacemos la conexion a la Base de Datos
    $link =  mysqli_connect($server, $username,$password,$data_base);
    
    //Checamos si hubo una conexion exitosa
     if (!$link) {
        die('No se ha podido establecer una conexión a la base de datos');
    }

?>