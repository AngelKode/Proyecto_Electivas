<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    //Verificamos que todos los datos se hayan recibido correctamente
    if(isset($_POST['ID_departamental']) && isset($_POST['fecha_oficio']) && isset($_POST['numero_oficio'])){
        
        //Antes de agregarlo, verificamos si no hay un registro igual
        $mysqli_request = "SELECT * FROM `oficios` WHERE `num_oficio` = '".$_POST['numero_oficio']."' AND `id_departamental` = '".intval($_POST['ID_departamental'])."';";
        $mysqli_response = mysqli_query($link, $mysqli_request);

        if($mysqli_response){
            //Checamos si existe o no un registro igual
            if(mysqli_num_rows($mysqli_response) > 0){
                $serverResponse['status'] = 'info';
                $serverResponse['message'] = 'No se puede agregar el oficio. Ya existe ese número de oficio.';
            }else{
                 //Hacemos la peticion a la bd
                $mysqli_request = "INSERT INTO `oficios` (`fecha`,`num_oficio`,`id_departamental`) VALUES('".$_POST['fecha_oficio']."','".$_POST['numero_oficio']."','".$_POST['ID_departamental']."')";
                $mysqli_response = mysqli_query($link, $mysqli_request);

                if($mysqli_response){
                    $serverResponse['status'] = 'success';
                    $serverResponse['message'] = 'Oficio agregado correctamente';
                    $serverResponse['id'] = mysqli_insert_id($link);
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