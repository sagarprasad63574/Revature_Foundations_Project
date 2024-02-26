# Revature_Foundations_Project

## Table of Contents
1. [Description](#Description)
2. [Endpoints](#Endpoints)
3. [Database](#Database-Model)
4. [Technology Stack](#Technology-Stack)

## Overview

### Description
Ticketing system backend API allows user's to register an account, loggin to an exisiting account, create a new reimbursement ticket.
Admins are able to view Pending tickets and Approve or Deny them.

### Endpoints

* /auth/register [POST] route to register a new user
* /auth/login [POST] route to login a user
* /auth?username="name" [GET] route to view user and user's ticket information
* /auth/:username [DELETE] admin route to delete a current user
* /tickets?status="Pending" [GET] admin route to view all users Pending tickets
* /tickets/:id [GET] route to view one ticket information
* /tickets [POST] route to add a new ticket to list
* /tickets [PUT] admin route to update a tickets status to either Approved or Deined 

### Database-Model
* Partition key: employee_id
* Gobal Secondary Index: username, role
* Table Schema
* employee_id (S), name (S), email (S), username (S), password (S), join_date (N), role (S), tickets (L)
  
### Technology-Stack
* Node
* Express
* DyanmoDB
* Jest
* Winston
