<?php

    include '../database/databaseConection.php';

    $serverResponse = array();

    //Checamos que se haya mandado correctamente el ID del registro
    if(isset($_POST['ID']) && isset($_POST['NameFile'])){
        //Hacemos la peticion a la base de datos
        $mysql_request = "DELETE FROM `constancia` WHERE ID =".$_POST['ID'].";";
        $mysql_response = mysqli_query($link, $mysql_request);

        //Checamos que se haya hecho con exito la peticion
        if($mysql_response && (mysqli_affected_rows($link) > 0)){
            $serverResponse['status'] = "success";
            $serverResponse['message'] = "La constancia se ha eliminado correctamente.";
            
            //Ahora eliminamos el archivo
            $urlDirectorio = "../../files/";
            $locationFileToDelete = $urlDirectorio . $_POST['NameFile'];

            //En caso de fallo al eliminar el archivo, mandamos la respuesta
            if(!unlink($locationFileToDelete)){
                $serverResponse['status'] = "danger";
                $serverResponse['message'] = "No se pudo encontrar el archivo. Inténtelo nuevamente.";
            }
        }else{
            $serverResponse['status'] = "warning";
            $serverResponse['message'] = "Error al eliminar la constancia. Inténtelo nuevamente.";
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