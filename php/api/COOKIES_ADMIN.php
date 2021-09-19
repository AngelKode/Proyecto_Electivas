<?php
    //Verificamos que existan, si no existen:
    /*
        1.- Aun no se inicia sesión
        2.- Ya expiró la sesión
    */
    if(isset($_COOKIE['token_id']) && ($_COOKIE['token_id'] == "admin") ){
        //Si no, retornamos las cookies
        echo json_encode(array(
            "Token"   => $_COOKIE['token_id'],
            "status"  => "OK"
        ));
    }else{
        echo json_encode(array(
            "message" => "Acceso denegado.",
            "status"  => "rejected"
        ));
    }
?>