<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    if(isset($_POST['newPasswd']) && isset($_POST['oldPasswd'])){
        $oldPasswdValue = $_POST['oldPasswd'];
        $newPasswdValue = $_POST['newPasswd'];
        
        //Verificamos que la contraseña ingresada sea la actual
        $mysqli_request = "SELECT * FROM `admin`";
        $mysqli_response = mysqli_query($link, $mysqli_request);
        
        if($mysqli_response){
            $actualPasswd = mysqli_fetch_array($mysqli_response)['Passwd'];

            if($actualPasswd == $oldPasswdValue){
                $mysqli_request = "UPDATE `admin` SET `Passwd`='".$newPasswdValue."';";
                $mysqli_response = mysqli_query($link, $mysqli_request);
        
                if($mysqli_response){
        
                    $serverResponse['status'] = "success";
        
                    if((mysqli_affected_rows($link)) > 0){
                        $serverResponse['message'] = "La constraseña se ha modificado correctamente.";
                    }else{
                        $serverResponse['message'] = "No se hicieron cambios en la contraseña.";
                    }
                }else{
                    $serverResponse['status'] = "danger";
                    $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";
                }
            }else{
                $serverResponse['status'] = "danger";
                $serverResponse['message'] = "La contraseña actual que ingresaste es incorrecta. Inténtelo nuevamente.";
            }
        }else{
            $serverResponse['status'] = "danger";
            $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";
        }        
    }else{
        $serverResponse['status'] = "danger";
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Cerramos la conexion con la bd
    mysqli_close($link);
?>