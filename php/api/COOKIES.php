<?php
    //Verificamos que existan, si no existen:
    /*
        1.- Aun no se inicia sesión
        2.- Ya expiró la sesión
    */
    if(isset($_COOKIE['token_id']) && isset($_COOKIE['nombre']) && isset($_COOKIE['programa'])){
        //Si no, retornamos las cookies
        echo json_encode(array(
            "Nombre" => $_COOKIE['nombre'],
            "Programa" => $_COOKIE['programa'],
            "Token"   => $_COOKIE['token_id'],
            "status"  => "OK"
        ));
    }else{
        echo json_encode(array(
            "message" => "Acceso denegado. Inicie sesión",
            "status"  => "rejected"
        ));
    }
?>