import React,{useState,useEffect} from 'react'
import axios from 'axios'

var APIclient = {
    async getTimeline(username : string){
        return await axios.get(`http://localhost:10001/api/getTimeline/${username}`) 
            .then( (res) => {
                return res
            })
            .catch((err) => {return err}
        );
    },
}

export default APIclient;
