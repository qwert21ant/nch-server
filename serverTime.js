class Time {
    formatDate(date){
        return  date.getDate().toString().padStart(2, "0") + "-" + 
                date.getMonth().toString().padStart(2, "0") + "-" + 
                date.getFullYear().toString().padStart(4, "0") + " " + 
                date.getHours().toString().padStart(2, "0") + ":" + 
                date.getMinutes().toString().padStart(2, "0") + ":" + 
                date.getSeconds().toString().padStart(2, "0");
    }

    getUTCDate(utc){
        let date = new Date();
        date.setDate(date.getUTCDate());
        date.setHours(date.getUTCHours() + utc);
        return date;
    }

    logTime(utc){
        return `[${this.formatDate(this.getUTCDate(utc))}]`;
    }
}

module.exports = new Time()