<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();

    //Verificamos que se hayan mandado correctamente los datos
    if(isset($_POST['semestre']) && isset($_POST['departamental']) && isset($_POST['observaciones'])){
        //Nos aseguramos de que el registro que se va a agregar, no esté repetido
        $mysqli_request = "SELECT * FROM `departamentales` WHERE `departamental` = '".$_POST['departamental']." Departamental' and `semestre` = '".$_POST['semestre']."'";
        $mysqli_response = mysqli_query($link, $mysqli_request);

        if($mysqli_response){
            //Verificamos que si se obtuvo un registro o no
            if(mysqli_num_rows($mysqli_response) == 0){
                //Si no lo hay, lo agregamos
                $mysqli_request = "INSERT INTO `departamentales`(`semestre`,`departamental`,`observaciones`) VALUES('".$_POST['semestre']."','".$_POST['departamental']." Departamental','".$_POST['observaciones']."')";
                $mysqli_response = mysqli_query($link, $mysqli_request);

                //Verificamos que se haya agregado correctamente
                if($mysqli_response){
                    $serverResponse['status'] = "success";
                    $serverResponse['message'] = "El registro se agregó correctamente.";
                    $serverResponse['ID'] = mysqli_insert_id($link);
                }else{
                    $serverResponse['status'] = "warning";
                    $serverResponse['message'] = "No se pudo agregar el registro. Inténtelo nuevamente.";
                }

            }else{
                $serverResponse['status'] = "info";
                $serverResponse['message'] = "No se pudo agregar. Ya hay un registro igual existente.";
            }
        }else{
            $serverResponse['status'] = "warning";
            $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";
        }
    }else{
        $serverResponse['status'] = "warning";
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente.";
    }

    //Nos desconectamos de la base de datos
    mysqli_close($link);

    //Mandamos la respuesta
    echo json_encode($serverResponse);

?>