<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    if(isset($_POST['ID'])){

        //Antes de eliminar el registro, verificamos si hay oficios relacionados, y si los hay, los eliminamos
        $mysqli_request = "SELECT * FROM `oficios` WHERE `id_departamental` = '".intval($_POST['ID'])."';";
        $mysqli_response = mysqli_query($link, $mysqli_request);

        //Checamos que se haya hecho correctamente
        if($mysqli_response){
            if((mysqli_num_rows($mysqli_response) > 0)){
                //Si hay registros, los eliminamos
                $mysqli_request = "DELETE FROM `oficios` WHERE `id_departamental` = '".intval($_POST['ID'])."';";
                $mysqli_response = mysqli_query($link, $mysqli_request);

                if(!$mysqli_response){
                    $serverResponse['status'] = 'danger';
                    $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
                }else{
                    //Eliminamos el registro si se eliminaron correctamente los registros relacionados
                    $mysqli_request = "DELETE FROM `departamentales` WHERE `id` = '".intval($_POST['ID'])."';";
                    $mysqli_response = mysqli_query($link, $mysqli_request);

                    if($mysqli_response){
                        $serverResponse['status'] = 'success';
                        $serverResponse['message'] = 'Se ha eliminado el registro correctamente';
                    }else{
                        $serverResponse['status'] = 'danger';
                        $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
                    }
                }
            }else{
                //Eliminamos el registro
                $mysqli_request = "DELETE FROM `departamentales` WHERE `id` = '".intval($_POST['ID'])."';";
                $mysqli_response = mysqli_query($link, $mysqli_request);

                if($mysqli_response){
                    $serverResponse['status'] = 'success';
                    $serverResponse['message'] = 'Se ha eliminado el registro correctamente';
                }else{
                    $serverResponse['status'] = 'danger';
                    $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
                }
            }
        }else{
            $serverResponse['status'] = 'danger';
            $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
        }
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente.';
    }


    //Nos desconectamos de la bd
    mysqli_close($link);

    //Mandamos la respuesta
    echo json_encode($serverResponse);

?>