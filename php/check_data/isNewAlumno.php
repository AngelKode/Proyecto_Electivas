<?php
    function getDataAlumnoIfExists($token){
        include '../database/databaseConection.php';

        //Definimos el encabezado para setear el set de caracteres
        header("Content-Type: text/html;charset=utf-8");

        //Configuramos el set de caracteres para la consulta
        mysqli_set_charset($link, "utf8");

        $mysqli_query = "SELECT * FROM `alumno` WHERE Boleta = '".intval($token)."';";
        $mysqli_response = mysqli_query($link, $mysqli_query);

        if($mysqli_response && (mysqli_affected_rows($link) > 0)){

            $alumnoData = mysqli_fetch_array($mysqli_response);

            //Nos desconectamos de la BD
            mysqli_close($link);

            return array(
                'estatus' => 'true',
                'token'   => $alumnoData['ID']
            );
        }

        //Nos desconectamos de la BD
        mysqli_close($link);

        return array(
            'estatus' => 'false'
        );
    }
?>