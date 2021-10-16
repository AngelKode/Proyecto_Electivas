<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    //Verificamos si se recibieron todos los parametros
    if(isset($_POST['ID']) && isset($_POST['semestreNuevo']) && isset($_POST['departamentalNuevo']) && isset($_POST['observaciones'])){
        
        //Checamos si no existe un registro con los datos a modificar
        $mysqli_request = "SELECT * FROM `departamentales` WHERE `semestre` = '".$_POST['semestreNuevo']."' AND `departamental` = '".$_POST['departamentalNuevo']."' AND `observaciones` = '".$_POST['observaciones']."';";
        $mysqli_response = mysqli_query($link, $mysqli_request);

        //Checamos que se haya hecho la peticion correctamente
        if($mysqli_response){
            //Si obtenemos ningun registro como respuesta, ese registro no existe
            if(mysqli_num_rows($mysqli_response) == 0){

                //Lo actualizamos
                $mysqli_request = "UPDATE `departamentales` SET `semestre` = '".$_POST['semestreNuevo']."', `departamental` = '".$_POST['departamentalNuevo']."', `observaciones` = '".$_POST['observaciones']."' WHERE `id` = '".$_POST['ID']."';";
                $mysqli_response = mysqli_query($link, $mysqli_request);

                if($mysqli_response){
                    $serverResponse['status'] = 'success';
                    $serverResponse['message'] = 'Registro actualizado correctamente.';
                }else{
                    $serverResponse['status'] = 'danger';
                    $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente.';
                }

            }else{
                $serverResponse['status'] = 'info';
                $serverResponse['message'] = 'No se puede actualizar. Ya existe un registro con esos datos.';
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