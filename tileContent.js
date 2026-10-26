"use strict";

window.LogisticsPreview = (() => {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const input = (id, label, type, value = "", attrs = "") => `<div class="control-field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" value="${escape(value)}" ${attrs}></div>`;
  const select = (id, label, values) => `<div class="control-field"><label for="${id}">${label}</label><select id="${id}" name="${id}">${values.map(v => `<option>${escape(v)}</option>`).join("")}</select></div>`;
  const table = (caption, headings, rows) => `<div class="reference-table" tabindex="0" role="region" aria-label="${caption}; scroll horizontally if necessary"><table><caption>${caption}</caption><thead><tr>${headings.map(h => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(cell => `<td>${escape(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

  function address(id) {
    const p = `address-${id}`;
    const form = document.createElement("form");
    form.className = "address-preview";
    form.innerHTML = `
      <nav class="section-nav" aria-label="Address sections">
        <a href="#${p}-overview">Overview</a><a href="#${p}-details">Address details</a><a href="#${p}-contacts">Contacts</a><a href="#${p}-linked">Customers & sites</a><a href="#${p}-usage">Operational usage</a>
      </nav>
      <div class="address-groups" id="${p}-overview">
        <fieldset><legend>Address summary</legend><div class="control-grid">
          ${input(`${p}-code`, "Address code", "text", "ADDR001", "required")}
          ${input(`${p}-name`, "Short name", "text", "Northside Foods HQ", "required")}
          ${select(`${p}-type`, "Address type", ["Head office", "Distribution centre", "Store"])}
          ${select(`${p}-use`, "Primary use", ["Corporate", "Collection", "Delivery"])}
          ${input(`${p}-created`, "Created on", "date", "2025-05-06")}
          ${input(`${p}-user`, "Created by", "text", "Mayuri", "readonly")}
        </div></fieldset>
        <fieldset id="${p}-details"><legend>Main address information</legend><div class="control-grid">
          ${input(`${p}-line1`, "Address line 1", "text", "Unit 1, Northside Park")}
          ${input(`${p}-line2`, "Address line 2", "text", "Newcastle upon Tyne")}
          ${input(`${p}-city`, "Town / city", "text", "Newcastle upon Tyne")}
          ${input(`${p}-postcode`, "Postcode", "text", "NE1 4EP")}
          ${input(`${p}-county`, "County / state", "text", "Tyne and Wear")}
          ${select(`${p}-country`, "Country", ["United Kingdom", "India", "France"])}
        </div></fieldset>
        <fieldset><legend>Status & geocoding</legend><div class="control-grid">
          ${select(`${p}-status`, "Status", ["Active", "Inactive", "Pending"])}
          ${select(`${p}-geo`, "Geocoding status", ["Geocoded", "Needs review", "Not geocoded"])}
          ${input(`${p}-lat`, "Latitude", "number", "54.9783", 'step="0.0001" min="-90" max="90"')}
          ${input(`${p}-long`, "Longitude", "number", "-1.6178", 'step="0.0001" min="-180" max="180"')}
          ${input(`${p}-checked`, "Last geocoded on", "datetime-local", "2025-05-06T09:15")}
          ${input(`${p}-reviewer`, "Last geocoded by", "text", "Alex Morgan", "readonly")}
        </div></fieldset>
      </div>
      <div class="summary-strip" aria-label="Address summary">
        <div><span>Address type</span><strong>Head office</strong></div><div><span>Country</span><strong>United Kingdom</strong></div><div><span>Linked customers</span><strong>2</strong></div><div><span>Linked sites</span><strong>3</strong></div><div><span>Geocoding</span><strong>Geocoded</strong></div>
      </div>
      <fieldset id="${p}-contacts"><legend>Contacts & operational settings · control examples</legend><div class="control-grid settings-grid">
        ${input(`${p}-email`, "Contact email", "email", "operations@example.com")}
        ${input(`${p}-phone`, "Contact phone", "tel", "+44 191 555 0100")}
        ${input(`${p}-website`, "Website", "url", "https://example.com")}
        ${input(`${p}-time`, "Preferred collection time", "time", "08:30")}
        ${input(`${p}-capacity`, "Daily load capacity", "number", "15", 'min="0" step="1"')}
        <div class="control-field"><label for="${p}-priority">Priority</label><input id="${p}-priority" name="priority" type="range" min="1" max="5" value="3"><small>1 = low, 5 = high</small></div>
        <div class="control-field"><span class="field-label" id="${p}-checks-label">Availability</span><div class="choices" role="group" aria-labelledby="${p}-checks-label"><label><input name="collections" type="checkbox" checked> Collections</label><label><input name="deliveries" type="checkbox" checked> Deliveries</label></div></div>
        <div class="control-field"><span class="field-label" id="${p}-radio-label">Access type</span><div class="choices" role="radiogroup" aria-labelledby="${p}-radio-label"><label><input type="radio" name="${p}-access" value="public" checked> Public</label><label><input type="radio" name="${p}-access" value="restricted"> Restricted</label></div></div>
        ${input(`${p}-attachment`, "Supporting document", "file")}
        <div class="control-field"><label for="${p}-notes">Delivery instructions</label><textarea id="${p}-notes" name="notes" rows="2">Use the main gate. Report to reception on arrival.</textarea></div>
      </div></fieldset>
      <section id="${p}-linked">${table("Linked customers and sites", ["Customer", "Customer code", "Site", "Site code", "Type", "Primary", "Status"], [["Northside Foods","CUST1001","Northside Foods HQ","SITE1001","Head office","Yes","Active"],["Northside Foods","CUST1001","Northside DC","SITE1030","Distribution centre","No","Active"],["Northside Foods","CUST1001","Northside Store 102","SITE1056","Store","No","Active"]])}</section>
      <section id="${p}-usage">${table("Recent operational usage", ["Reference type", "Reference", "Activity", "Event date", "Status"], [["Load","LOAD001234","Delivery","06 May 2025 09:15","Completed"],["Shipment","SHIP0005678","Pickup","02 May 2025 14:30","Completed"],["Order","ORD0009111","Order creation","30 Apr 2025 11:05","Completed"]])}</section>
      <div class="preview-actions"><button class="primary" type="submit">Save preview</button><button type="reset">Reset</button><output class="local-message" aria-live="polite"></output></div>`;
    form.addEventListener("submit", event => {
      event.preventDefault();
      form.querySelector("output").textContent = "Form validated. Preview only; no server data saved.";
    });
    form.addEventListener("reset", () => { form.querySelector("output").textContent = ""; });
    form.querySelectorAll(".section-nav a").forEach(link => link.addEventListener("click", event => {
      event.preventDefault();
      const target = form.querySelector(`[id="${link.hash.slice(1)}"]`);
      target.scrollIntoView({block: "nearest", inline: "nearest"});
    }));
    return form;
  }

  function loads(id) {
    const p = `loads-${id}`;
    const content = document.createElement("div");
    content.className = "loads-preview";
    const customers = ["Northside Foods", "Chilled Food Products", "Restaurant Supplies Ltd", "Catering Services Co", "Dairy Products", "Acme Logistics", "Global Retail Ltd"];
    const records = Array.from({length:20}, (_, index) => ({reference:`LD${String(127+index).padStart(6,"0")}`,status:["In transit","Planned","Delivered","Delayed"][index%4],customer:customers[index%7],collection:"12/05 06:00",delivery:"12/05 14:00",vehicle:["Rigid 26T","Curtain sider","Box van"][index%3],driver:["Michael Brown","John Smith","Sarah Johnson"][index%3],quantity:4+index,weight:`${(3400+index*500).toLocaleString("en-GB")} kg`,eta:"12/05 13:30"}));
    content.innerHTML = `
      <div class="list-toolbar"><p>Loads, collections & deliveries</p><button type="button" data-action="new">+ New sample load</button><button type="button" data-action="export">Export CSV</button></div>
      <div class="load-filters">
        ${input(`${p}-search`,"Search","search","",'placeholder="Search loads or customers"')}
        ${select(`${p}-status`,"Status",["All","In transit","Planned","Delivered","Delayed"])}
        ${input(`${p}-from`,"Date from","date","2025-05-01")}
        ${input(`${p}-to`,"Date to","date","2025-05-31")}
        ${select(`${p}-customer`,"Customer",["All",...customers])}
        <div class="filter-actions"><button type="button" data-action="clear">Clear</button><button class="primary" type="button" data-action="apply">Apply</button></div>
      </div>
      <div class="reference-table load-table" tabindex="0" role="region" aria-label="Load records; scroll horizontally if necessary">
      <table><caption class="sr-only">Load management sample records</caption><thead><tr><th><input type="checkbox" aria-label="Select all visible loads" data-select-all></th>${["Load ref","Status","Customer","Collection","Delivery","Vehicle","Driver","Quantity","Weight","ETA"].map(label=>`<th scope="col">${label}</th>`).join("")}</tr></thead><tbody></tbody></table></div>
      <div class="list-summary"><span data-count></span><span>20 sample records · filter locally</span></div>
      <p class="local-message" role="status"></p>`;
    const field = suffix => content.querySelector(`#${p}-${suffix}`);
    function render() {
      const search = field("search").value.toLowerCase();
      const status = field("status").value;
      const customer = field("customer").value;
      const from = field("from").value, to = field("to").value;
      const shown = records.filter(r => (`${r.reference} ${r.customer}`.toLowerCase().includes(search)) && (status === "All" || r.status === status) && (customer === "All" || customer === r.customer) && (!from || from <= "2025-05-12") && (!to || to >= "2025-05-12"));
      content.querySelector("tbody").innerHTML = shown.map(r => `<tr><td><input type="checkbox" aria-label="Select ${r.reference}"></td><td><strong>${r.reference}</strong></td><td><span class="status-badge ${r.status.replace(" ","-").toLowerCase()}">${r.status}</span></td>${[r.customer,r.collection,r.delivery,r.vehicle,r.driver,r.quantity,r.weight,r.eta].map(v=>`<td>${escape(v)}</td>`).join("")}</tr>`).join("");
      content.querySelector("[data-count]").textContent = `Showing ${shown.length} of ${records.length} loads`;
      content.querySelector("[data-select-all]").checked = false;
      content.querySelector(".list-summary span:last-child").textContent = `${records.length} sample records · filter locally`;
      return shown;
    }
    content.querySelector('[data-action="apply"]').addEventListener("click", render);
    content.querySelector('[data-action="clear"]').addEventListener("click", () => {
      ["search","from","to"].forEach(suffix => field(suffix).value = "");
      ["status","customer"].forEach(suffix => field(suffix).value = "All");render();
    });
    content.querySelector("[data-select-all]").addEventListener("change",event=>content.querySelectorAll("tbody input").forEach(input=>input.checked=event.target.checked));
    content.querySelector('[data-action="new"]').addEventListener("click",()=>{records.unshift({...records[0],reference:`LD${String(127+records.length).padStart(6,"0")}`,status:"Planned"});render();});
    content.querySelector('[data-action="export"]').addEventListener("click",()=>{
      const shown = render();
      const keys=Object.keys(records[0]);
      const csv=[keys.join(","),...shown.map(r=>keys.map(k=>`"${String(r[k]).replace(/"/g,'""')}"`).join(","))].join("\r\n");
      const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
      const link=document.createElement("a");link.href=url;link.download="sample-loads.csv";link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
    render();
    return content;
  }
  return {create:(kind,id)=>kind === "wide" ? loads(id) : address(id)};
})();
