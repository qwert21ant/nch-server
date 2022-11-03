const Time = {
    formatDate(date){
        return  date.getUTCDate().toString().padStart(2, "0") + "-" + 
                (date.getUTCMonth() + 1).toString().padStart(2, "0") + "-" + 
                date.getUTCFullYear().toString().padStart(4, "0") + " " + 
                date.getUTCHours().toString().padStart(2, "0") + ":" + 
                date.getUTCMinutes().toString().padStart(2, "0") + ":" + 
                date.getUTCSeconds().toString().padStart(2, "0");
    },

    getUTCDate(utc){
        return new Date((new Date()).getTime() + 3600 * 1000 * 3);
    },

    logTime(utc){
        return `[${this.formatDate(this.getUTCDate(utc))}]`;
    }
}

module.exports = Time; 