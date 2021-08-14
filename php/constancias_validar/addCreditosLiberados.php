<?php

    include '../database/databaseConection.php';

    //Definimos el encabezado para setear el set de caracteres
    header("Content-Type: text/html;charset=utf-8");

    //Configuramos el set de caracteres para la consulta
    mysqli_set_charset($link, "utf8");

    function getJSONData($dataToConvert){
        $dataResult = array();

        foreach($dataToConvert as $dataValue){
            $dataNew = array();
            foreach($dataValue as $valueKey => $valueData){
                $dataNew[$valueKey] = $valueData;
            }
            array_push($dataResult, $dataNew);
        }

        return $dataResult;
    }

    $serverResponse = array();

    if(isset($_POST['newRegistroElectivasLiberadas'])){
        //Convertimos lo que se manda, a un objeto
        $dataSentToArray = getJSONData(json_decode($_POST['newRegistroElectivasLiberadas']));
    
        //Obtenemos lo que se mandó
        $newRowConstanciaValidada = $dataSentToArray[0];

        //Obtenemos el ID de la constancia que se valida
        $ID_Constancia = $newRowConstanciaValidada['ID_Constancia'];

        //Recorremos el arreglo de los creditos que se le asignan a cada electiva, y por cada una, creamos 1 registro
        $arrayCreditos = json_decode(json_encode($newRowConstanciaValidada['Creditos']),true);

        foreach($arrayCreditos as $data){
            //Si los creditos dados, son mayores a 0, lo creamos
            if(floatval($data['Creditos']) > 0){
                //Hacemos la peticion para agregarlo a la tabla de las constancias ya validadas
                $mysql_add_register = "INSERT INTO `constancia_electiva` (`Electiva_id`, `Constancia_id`, `Creditos`) VALUES ('".intval($data['IDElectiva'])."','".intval($ID_Constancia)."','".floatval($data['Creditos'])."');";
                $mysql_response = mysqli_query($link, $mysql_add_register);

                //En caso de haber algun error, nos salimos del ciclo, y mandamos el error
                if(!$mysql_response){
                    $serverResponse['status'] = 'danger';
                    $serverResponse['message'] = 'Error de la base de datos. Inténtelo nuevamente.';
                    break;
                }else{
                    $serverResponse['status'] = 'success';
                }
            }
        }
    }else{
        $serverResponse['status'] = 'danger';
        $serverResponse['message'] = 'Error del servidor. Inténtelo nuevamente';
    }

    //Mandamos la respuesta del servidor
    echo json_encode($serverResponse);


    //Nos desconectamos de la BD
    mysqli_close($link);
?>