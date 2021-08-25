<?php
    try{
        //Eliminamos las cookies
        unset($_COOKIE["token_id"]);
        unset($_COOKIE["nombre"]);
        unset($_COOKIE["programa"]);

        setcookie("token_id", '', time() - 3600, "/");
        setcookie("nombre", '', time() - 3600, "/");
        setcookie("programa", '', time() - 3600, "/");

        echo json_encode(array(
            "status" => "OK",
        ));

    }catch(Exception $err){
        echo json_encode(array(
            "status" => "error",
            "message" => "Error del servidor. Inténtelo nuevamente."
        ));
    }
?>