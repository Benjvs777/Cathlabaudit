<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Audit Tool</title>
  <style>
    .audit-item { cursor: pointer; margin: 10px 0; }
    .checked-item { text-decoration: line-through; }
  </style>
</head>
<body>
  <h1>Audit Sections</h1>
  <div id="audit-list">
    <div class="audit-item" data-id="audit1">Patient Records <span class="icon pending"></span></div>
    <div class="audit-item" data-id="audit2">Medication Logs <span class="icon pending"></span></div>
    <div class="audit-item" data-id="audit3">Equipment Safety <span class="icon pending"></span></div>
    <div class="audit-item" data-id="audit4">Temperatures <span class="icon pending"></span></div>
  </div>

  <h2 id="audit-title"></h2>
  <ul id="audit-checklist"></ul>

  <label for="user-select">User:</label>
  <select id="user-select">
    <option value="Nurse A">Nurse A</option>
    <option value="Nurse B">Nurse B</option>
  </select>

  <progress id="progress" value="0" max="100"></progress>
  <span id="progress-text">0%</span>

  <button id="amend-button" style="display:none;">Amend</button>

  <script src="https://krzbkjuoimbzfhspqwuk.supabase.co</script>
  script.js</script>
</body>
</html>
