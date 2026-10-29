from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from models import Room, RoomCreate
from database import DatabaseAccess

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])

@router.get("", response_model=List[Room])
def list_rooms(
    status: Optional[str] = Query(None, description="Filter by status: Available, Occupied, Cleaning, Maintenance"),
    category: Optional[str] = Query(None, description="Filter by category")
):
    rooms = DatabaseAccess.get_rooms()
    if status:
        rooms = [r for r in rooms if r.get("status", "").lower() == status.lower()]
    if category:
        rooms = [r for r in rooms if r.get("category", "").lower() == category.lower()]
    return rooms

@router.get("/{room_id}", response_model=Room)
def get_room(room_id: str):
    room = DatabaseAccess.get_room_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room

@router.post("", response_model=Room, status_code=201)
def create_room(room_in: RoomCreate):
    # Check if room number already exists
    existing = DatabaseAccess.get_rooms()
    if any(r["room_number"].strip().lower() == room_in.room_number.strip().lower() for r in existing):
        raise HTTPException(status_code=400, detail=f"Room number '{room_in.room_number}' already exists!")
    
    room_dict = room_in.model_dump()
    saved = DatabaseAccess.save_room(room_dict)
    return saved

@router.put("/{room_id}", response_model=Room)
def update_room(room_id: str, room_in: RoomCreate):
    existing = DatabaseAccess.get_room_by_id(room_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Room not found")
    
    # Check if duplicate room number elsewhere
    all_rooms = DatabaseAccess.get_rooms()
    for r in all_rooms:
        if r["id"] != room_id and r["room_number"].strip().lower() == room_in.room_number.strip().lower():
            raise HTTPException(status_code=400, detail=f"Room number '{room_in.room_number}' is already used by another room!")
    
    updated_dict = room_in.model_dump()
    updated_dict["id"] = room_id
    saved = DatabaseAccess.save_room(updated_dict)
    return saved

@router.patch("/{room_id}/status")
def update_room_status(room_id: str, status: str = Query(..., description="New status")):
    valid_statuses = ["Available", "Occupied", "Cleaning", "Maintenance"]
    matching_status = next((s for s in valid_statuses if s.lower() == status.lower()), None)
    if not matching_status:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of {valid_statuses}")
    
    success = DatabaseAccess.update_room_status(room_id, matching_status)
    if not success:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"message": "Room status updated successfully", "status": matching_status}

@router.delete("/{room_id}")
def delete_room(room_id: str):
    room = DatabaseAccess.get_room_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if room.get("status") == "Occupied":
        raise HTTPException(status_code=400, detail="Cannot delete an Occupied room! Check out guest first.")
    
    DatabaseAccess.delete_room(room_id)
    return {"message": "Room deleted successfully"}
