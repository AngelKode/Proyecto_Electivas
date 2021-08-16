<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    $serverResponse = array();
    $serverResponse['electivas'] = array();

    if(isset($_POST['Alumno_id'])){
        $mysql_request = "SELECT constancia.Actividad, constancia.Horas, constancia_electiva.Creditos, denominacion.EjeTematico, denominacion.Modalidad, denominacion.Factor, electiva.Nombre, electiva.Creditos_acumulados FROM `constancia` INNER JOIN `constancia_electiva` on constancia.ID = constancia_electiva.Constancia_id INNER JOIN `denominacion` on constancia.Denominacion_id = denominacion.ID INNER JOIN `electiva` on electiva.ID = constancia_electiva.Electiva_id WHERE constancia.Alumno_id = '".intval($_POST['Alumno_id'])."' AND constancia.Valida = '2' ORDER BY electiva.Nombre;";
        $mysql_response = mysqli_query($link, $mysql_request);

        if(mysqli_num_rows($mysql_response) > 0){
            while($row = mysqli_fetch_array($mysql_response)){
                $answer['Actividad'] = $row['Actividad'];
                $answer['Creditos'] = $row['Creditos'];
                $answer['Creditos_acumulados'] = $row['Creditos_acumulados'];
                $answer['EjeTematico'] = $row['EjeTematico'];
                $answer['Factor'] = $row['Factor'];
                $answer['Horas'] = $row['Horas'];
                $answer['Modalidad'] = $row['Modalidad'];
                $answer['Nombre'] = $row['Nombre'];

                array_push($serverResponse['electivas'],$answer);
            }
            $serverResponse['status'] = 'success';
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

    //Nos desconectamos de la base de datos
    mysqli_close($link);
?>