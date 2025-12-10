import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, TicketPriority, TicketCategory } from './dto/create-ticket.dto';
import { UpdateTicketDto, TicketStatus } from './dto/update-ticket.dto';
import { v4 as uuidv4 } from 'uuid';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  companyId: string;
  subject: string;
  message: string;
  priority: TicketPriority;
  category: TicketCategory;
  status: TicketStatus;
  orderId?: string;
  assignedTo?: string;
  responses: TicketResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketResponse {
  id: string;
  ticketId: string;
  userId: string;
  message: string;
  isAdmin: boolean;
  createdAt: Date;
}

@Injectable()
export class SupportTicketsService {
  private tickets: Map<string, SupportTicket> = new Map();
  private ticketCounter = 1000;

  constructor(private prisma: PrismaService) {}

  async createTicket(
    userId: string,
    companyId: string,
    merchantId: string,
    dto: CreateTicketDto,
  ): Promise<SupportTicket> {
    const ticket: SupportTicket = {
      id: uuidv4(),
      ticketNumber: `TKT-${++this.ticketCounter}`,
      userId,
      companyId,
      subject: dto.subject,
      message: dto.message,
      priority: dto.priority || TicketPriority.MEDIUM,
      category: dto.category || TicketCategory.OTHER,
      status: TicketStatus.OPEN,
      orderId: dto.orderId,
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  async getTicketsByUser(userId: string): Promise<SupportTicket[]> {
    return Array.from(this.tickets.values())
      .filter(t => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTicketsByCompany(companyId: string): Promise<SupportTicket[]> {
    return Array.from(this.tickets.values())
      .filter(t => t.companyId === companyId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllTickets(merchantId: string): Promise<SupportTicket[]> {
    // Admin: Tüm ticket'ları getir
    return Array.from(this.tickets.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTicketById(id: string): Promise<SupportTicket> {
    const ticket = this.tickets.get(id);
    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }
    return ticket;
  }

  async updateTicket(id: string, dto: UpdateTicketDto): Promise<SupportTicket> {
    const ticket = await this.getTicketById(id);

    if (dto.status) {
      ticket.status = dto.status;
    }
    if (dto.assignedTo) {
      ticket.assignedTo = dto.assignedTo;
    }
    if (dto.response) {
      ticket.responses.push({
        id: uuidv4(),
        ticketId: id,
        userId: dto.assignedTo || 'admin',
        message: dto.response,
        isAdmin: true,
        createdAt: new Date(),
      });
    }

    ticket.updatedAt = new Date();
    this.tickets.set(id, ticket);
    return ticket;
  }

  async addResponse(
    ticketId: string,
    userId: string,
    message: string,
    isAdmin: boolean = false,
  ): Promise<SupportTicket> {
    const ticket = await this.getTicketById(ticketId);

    ticket.responses.push({
      id: uuidv4(),
      ticketId,
      userId,
      message,
      isAdmin,
      createdAt: new Date(),
    });

    ticket.updatedAt = new Date();
    this.tickets.set(ticketId, ticket);
    return ticket;
  }

  async getTicketStats(merchantId: string): Promise<{
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    avgResponseTime: number;
  }> {
    const tickets = await this.getAllTickets(merchantId);
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === TicketStatus.OPEN).length,
      inProgress: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
      resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
      avgResponseTime: 0, // TODO: Calculate from responses
    };
  }
}
