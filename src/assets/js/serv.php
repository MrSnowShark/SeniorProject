<?php
  error_log("test.php got a request!");
  foreach ($_POST as $key => $value) {
    if (is_array($value)) {
      error_log("_POST['$key']: '" . print_r($value, true) . "'");
    } else {
      error_log("_POST['$key']: '$value'");
    }
  }
  $a = array(
    "name" => "bob",
    "values" => array( 5, 3, 2, 1 ),
    "email" => "bill@microsoft.com"
  );
  echo json_encode($a);
?>
