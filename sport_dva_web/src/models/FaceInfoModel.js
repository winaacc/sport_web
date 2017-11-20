export default {
    namespace:'faceinfo',
    state:{
        face_token:null,
        faceset_token:null,
        image_url:null,
        phonenumber:null,
        nickname:null,
        cityname:null,
        face_rectangle:null,
        landmark:null,
        attributes:null,
        createtime:null
    },
    reducers:{
        login(state,payload){
            var data = payload.data;
            delete data._id;
            return {...state,...data}
        },
        updatenickname(state,{payload}){
            return {...state,...payload}
        }
    },
    effects:{

    }
}