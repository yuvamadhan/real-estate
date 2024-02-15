
import { prisma } from "../config/prismaConfig.js";

export const createUser = async(req ,res) => {
    console.log("creating a user");

    let {email} = req.body;
    const userExists = await prisma.user.findUnique({where : {email: email}})
    if (!userExists){

        const user =await prisma.user.create({data: req.body})
        res.send({
            message: "user registered successfully",
            user: user,
        });

    }
    else res.status(201).send({message: "user already registered"})
};

// function to book a visit to resd
export const bookVisit = async(req, res) =>{
    const {email, date} = req.body
    const {id} = req.params

    try{

        const alreadyBooked = await prisma.user.findUnique({
            where: {email},
            select: {bookedVisits : true},

        });
        // res.send(alreadyBooked);
        if(alreadyBooked.bookedVisits.some((visit)=> visit.id === id)){
            res.status(400).send({message: "this residency is already booked bu you"});

        }
        else{
            await prisma.user.update({
                where: {email: email},
                data:
                {
                    bookedVisits: {push: {id,date}},
                },
            });
        }
    res.send(" your visit is booked successfully");
        
    }catch(err){
        throw new Error(err.message);
    }
};

//function to get all bookings of the user
export const getAllBookings = async(req, res) =>{
    const {email} =req.body

    try{
        const bookings = await prisma.user.findUnique({
            where: {email},
            select: {bookedVisits: true}

        });
        res.status(200).send(bookings);

    }catch(err){
        throw new Error(err.message);
    }

};

//function to cancel the booking
export const cancelBooking = async(req, res)=>{
    const {email} =req.body;
    const {id} = req.params

    try{

        const user = await prisma.user.findUnique({
            where : {email : email},
            select : {bookedVisits: true}
        })

        const index = user.bookedVisits.findIndex((visit)=> visit.id === id)

        if(index === -1){
            res.status(404).json({message: "booking not found"});
        }else{
            user.bookedVisits.splice(index, 1)
            await prisma.user.update({
                where: {email},
                data: {
                    bookedVisits: user.bookedVisits
                },
            });

            res.send("booking cancelled successfully");
        }

    }catch(err){
        throw new Error(err.message);
    }
};

//function to add a resd in favorite list of a user
export const toFav = async(req,res) =>{
    const {email} =req.body;
    const {rid} = req.params;

    try{

        const user = await prisma.user.findUnique({
            where: {email}
        })
        if(user.favResidenciesiD.includes(rid)){
            const updateUser =await prisma.user.update({
                where: {email},
                data: {
                    favResidenciesiD:{
                        set: user.favResidenciesiD.filter((id)=> id !== rid)

                    }
                }
            });
            res.send({message: "removed from favorites", user : updateUser})

        }
        else{
            const updateUser= await prisma.user.update({
                where: {email},
                 data:{
                    favResidenciesiD:{
                        push: rid
                    }               
                }
            })
            res.send({message: "updated favorites", user: updateUser})
        }


    }catch(err){
        throw new Error(err.message);
    }
}

//function to  get all favourites
export const getAllFavorites = async(req, res) =>{
    const {email} =req.body;

    try{
        const favResd = await prisma.user.findUnique({
            where: {email},
            select: {favResidenciesiD: true}

        });
        res.status(200).send(favResd);

    }catch(err){
        throw new Error(err.message);
    }

};
