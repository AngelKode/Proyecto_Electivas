<?php

    include '../database/databaseConection.php';

    $serverResponse = array();

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");
    
    if($_POST['Alumno_id']){
        //Hacemos la peticion para obtener los creditos de las constancias del alumno que ya fueron validados
        $mysql_request = "SELECT constancia.Creditos, constancia.ID FROM `constancia` WHERE Alumno_id ='".intval($_POST['Alumno_id'])."' AND Valida = '2' ORDER BY `Actividad` ASC;";
        $mysql_response = mysqli_query($link,$mysql_request);

        if($mysql_response){
            while($row = mysqli_fetch_array($mysql_response)){
                $data = array();
                $data['Creditos'] = $row['Creditos'];
                $data['ID'] = $row['ID'];
                array_push($serverResponse, $data);
            }
        }else{
            $serverResponse['status'] = 'danger';
            $serverResponse['message'] = "Error de la base de datos. Inténtelo nuevamente.";  
        }
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = "Error del servidor. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($serverResponse);

    //Nos desconectamos de la BD
    mysqli_close($link);
?>