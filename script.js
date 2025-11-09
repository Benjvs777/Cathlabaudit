document.addEventListener("DOMContentLoaded", () => {
  // === Supabase Initialization ===
  const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your Supabase URL
  const supabaseKey = 'your-anon-key'; // Replace with your anon/public key
  const supabase = supabase.createClient(supabaseUrl, supabaseKey);

  const audits = {
    audit1: {
      title: "Patient Records",
      type: "checklist",
      items: [
        "Verify patient ID",
        "Check admission date",
        "Review discharge summary"
      ]
    },
    audit2: {
      title: "Medication Logs",
      type: "checklist",
      items: [
        "Confirm dosage accuracy",
        "Check administration times",
        "Review allergy documentation"
      ]
    },
    audit3: {
      title: "Equipment Safety",
      type: "checklist",
      items: [
        "Inspect defibrillator",
        "Check oxygen tanks",
        "Review maintenance logs"
      ]
    },
    audit4: {
      title: "Temperatures",
      type: "temperature",
      labs: {
        "Lab 1": ["Room Temperature"],
        "Lab 2": ["Room Temperature"],
        "Lab 3": ["Room Temperature", "Fridge Temperature"],
        "Lab 4": ["Room Temperature"],
        "Lab 5": ["Room Temperature"]
      }
    }
  };

  let currentAuditId = null;
  let checklistState = {};

  function updateProgress() {
    const state = checklistState[currentAuditId];
    let total = 0;
    let filled = 0;

    if (audits[currentAuditId].type === "checklist") {
      total = state.length;
      filled = state.filter(item => item.checked).length;
    } else if (audits[currentAuditId].type === "temperature") {
      for (const lab of state) {
        for (const field of lab.fields) {
          total += 3;
          if (field.max && field.min && field.current) filled += 3;
        }
      }
    }

    const percent = total ? Math.round((filled / total) * 100) : 0;
    document.getElementById("progress").value = percent;
    document.getElementById("progress-text").textContent = `${percent}%`;

    const icon = document.querySelector(`.audit-item[data-id="${currentAuditId}"] .icon`);
    if (icon) {
      icon.classList.toggle("completed", percent === 100);
      icon.classList.toggle("pending", percent !== 100);
    }

    const amendButton = document.getElementById("amend-button");
    if (audits[currentAuditId].type === "checklist") {
      const checklistItems = document.querySelectorAll(".check-item");
      if (percent === 100) {
        checklistItems.forEach(cb => cb.disabled = true);
        amendButton.style.display = "inline-block";
      } else {
        checklistItems.forEach(cb => cb.disabled = false);
        amendButton.style.display = "none";
      }
    } else {
      amendButton.style.display = "none";
    }
  }

  function renderChecklist() {
    const checklist = document.getElementById("audit-checklist");
    checklist.innerHTML = "";

    const items = checklistState[currentAuditId];
    items.sort((a, b) => a.checked - b.checked);

    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.className = item.checked ? "checked-item" : "";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "check-item";
      checkbox.checked = item.checked;
      checkbox.id = `task-${index}`;

      const label = document.createElement("label");
      label.htmlFor = `task-${index}`;
      label.textContent = item.text;

      const meta = document.createElement("span");
      meta.className = "meta-info";
      meta.textContent = item.checked ? `✔ by ${item.user} on ${item.timestamp}` : "";

      checkbox.addEventListener("change", async () => {
        const selectedUser = document.getElementById("user-select").value;
        item.checked = checkbox.checked;
        item.timestamp = checkbox.checked ? new Date().toLocaleString() : "";
        item.user = checkbox.checked ? selectedUser : "";

        renderChecklist();
        updateProgress();

        if (checkbox.checked) {
          const { error } = await supabase
            .from('audit_checklist_items')
            .insert([{
              audit_id: currentAuditId,
              item_text: item.text,
              checked: true,
              timestamp: new Date().toISOString(),
              user: selectedUser
            }]);

          if (error) {
            console.error("Supabase insert error:", error.message);
          } else {
            console.log("Item submitted to Supabase:", item.text);
          }
        }
      });

      li.appendChild(checkbox);
      li.appendChild(label);
      li.appendChild(meta);
      checklist.appendChild(li);
    });

    updateProgress();
  }

  function renderTemperatureInputs() {
    const checklist = document.getElementById("audit-checklist");
    checklist.innerHTML = "";

    const labs = checklistState[currentAuditId];

    labs.forEach((lab) => {
      lab.fields.forEach((field) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${lab.name} - ${field.name}</strong>`;

        ["max", "min", "current"].forEach(type => {
          const input = document.createElement("input");
          input.type = "number";
          input.placeholder = type;
          input.className = "temp-input";
          input.value = field[type];
          input.addEventListener("input", () => {
            field[type] = input.value;
            updateProgress();
          });
          li.appendChild(input);
        });

        checklist.appendChild(li);
      });
    });

    updateProgress();
  }

  function loadAudit(auditId) {
    currentAuditId = auditId;
    const audit = audits[auditId];
    document.getElementById("audit-title").textContent = audit.title;

    if (audit.type === "checklist") {
      if (!checklistState[auditId]) {
        checklistState[auditId] = audit.items.map(text => ({
          text,
          checked: false,
          timestamp: "",
          user: ""
        }));
      }
      renderChecklist();
    } else if (audit.type === "temperature") {
      if (!checklistState[auditId]) {
        checklistState[auditId] = Object.entries(audit.labs).map(([labName, fields]) => ({
          name: labName,
          fields: fields.map(name => ({
            name,
            max: "",
            min: "",
            current: ""
          }))
        }));
      }
      renderTemperatureInputs();
    }
  }

  document.querySelectorAll(".audit-item").forEach(item => {
    item.addEventListener("click", () => {
      const auditId = item.getAttribute("data-id");
      loadAudit(auditId);
    });
  });

  document.getElementById("amend-button").addEventListener("click", () => {
    const checklistItems = document.querySelectorAll(".check-item");
    checklistItems.forEach(cb => cb.disabled = false);
    document.getElementById("amend-button").style.display = "none";
  });
});
