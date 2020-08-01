class CovidCostDataTable extends HTMLElement {
    connectedCallback() {

      this._upgradeProperty('stats');
      this.innerHTML = `
          <h3> Hyderabad </h3>
          <table>
            <th>
              <td> Hospital Name, Area </td>
              <td colspan="3"> Inital Deposit </td>
              <td colspan="3"> Per day cost estimate (with insurance)</td>
              <td colspan="3"> Per day cost estimate (without insurance)</td>
            </th>
            <th>
            </th>
             <tr>
               <td>Moonlight, Machbowli </td>
               <td>5000</td>
               <td>5000</td>
               <td>5000</td>
             </tr>
          </table>
      `;
    }

    _upgradeProperty(prop) {
      if (this.hasOwnProperty(prop)) {
        let value = this[prop];
        delete this[prop];
        this[prop] = value;
      }
    }
}

customElements.define('covid-cost-data-table', CovidCostDataTable);


