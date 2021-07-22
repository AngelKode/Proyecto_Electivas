<?php

    include "../database/databaseConection.php";

    $IdDataToBeUpdated = $_POST['ID'];
    $EjeTematicoNewValue = $_POST['EjeTematico'];
    $ModalidadNewValue = $_POST['Modalidad'];
    $DescripcionNewValue = $_POST['Descripcion'];
    $FactorNewValue = $_POST['Factor'];
    $EjemplosNewValue = $_POST['Ejemplos'];

    $responseServer = array();

    //Verificamos que los datos para actualizar se hayan mandado
    if(isset($IdDataToBeUpdated) && isset($EjeTematicoNewValue) && isset($ModalidadNewValue) && isset($DescripcionNewValue) && isset($FactorNewValue) && isset($EjemplosNewValue)){

        //Hacemos la peticion a la base de datos
        $mysqlQuery = "UPDATE `denominacion` SET `EjeTematico`='".$EjeTematicoNewValue."',`Modalidad`='".$ModalidadNewValue."',`Descripcion`='".$DescripcionNewValue."',`Factor`='".$FactorNewValue."',`Ejemplos`='".$EjemplosNewValue."' WHERE ID =" . $IdDataToBeUpdated . ";";
        $mysqlResponse = mysqli_query($link, $mysqlQuery);

        //De acuerdo a la respuesta de la base de datos, mandamos el mensaje
        if($mysqlResponse){
            $responseServer['status'] = "success";
            if(mysqli_affected_rows($link) > 0){
                $responseServer['message'] = "Denominación actualizada correctamente.";
            }else{
                $responseServer['message'] = "No se hicieron cambios a la denominación.";
            }
        }else{
            $responseServer['status'] = "warning";
            $responseServer['message'] = "No se pudo actualizar la denominación. Inténtelo nuevamente.";
        }

    }else{
        $responseServer['status'] = "danger";
        $responseServer['message'] = "Error al hacer la petición al servidor. Inténtelo nuevamente.";
    }

    //Mandamos la respuesta
    echo json_encode($responseServer);

    //Nos desconectamos de la BD
    mysqli_close($link);
?>