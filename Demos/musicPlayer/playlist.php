<?php  
    $searchUrl = 'http://music.163.com/api/playlist/detail?id=';  
    if(!empty($_GET['id']))  
    {  
        $searchUrl .= $_GET['id']; 
    }
    header('Content-Type:application/json;charset=UTF-8');
    echo file_get_contents($searchUrl);  
?> 
